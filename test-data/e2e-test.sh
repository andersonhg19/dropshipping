#!/bin/bash
# VISNEX E2E Test Suite
# Verifica el flujo completo: login -> import -> enrich -> publish

BASE_URL="${BASE_URL:-http://localhost}"
AUTH_PORT=8842
ACQ_PORT=8846
COM_PORT=8847
WP_PORT=8850
FE_PORT=3001

PASS=0
FAIL=0
SKIP=0

assert_eq() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "  PASS: $desc"
    PASS=$((PASS+1))
  else
    echo "  FAIL: $desc (expected=$expected, got=$actual)"
    FAIL=$((FAIL+1))
  fi
}

assert_not_empty() {
  local desc="$1" value="$2"
  if [ -n "$value" ] && [ "$value" != "null" ]; then
    echo "  PASS: $desc"
    PASS=$((PASS+1))
  else
    echo "  FAIL: $desc (empty or null)"
    FAIL=$((FAIL+1))
  fi
}

echo "=============================="
echo "VISNEX E2E Test Suite"
echo "=============================="

# Test 1: Frontend responds
echo ""
echo "[1] Frontend Health"
FE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL:$FE_PORT)
assert_eq "Frontend :$FE_PORT responds" "200" "$FE_STATUS"

# Test 2: Eureka has all services
echo ""
echo "[2] Eureka Service Registry"
SERVICES=$(curl -s $BASE_URL:8840/eureka/apps 2>/dev/null | grep -o '<name>[^<]*</name>' | sort -u | wc -l)
assert_eq "Eureka has 7+ services" "1" "$([ $SERVICES -ge 7 ] && echo 1 || echo 0)"

# Test 3: Login
echo ""
echo "[3] Authentication"
EP=$(node -e "const c=require('crypto'),k=Buffer.from('3a1f8a790c238b8df0d447b53d792134b5cc7f2c8f7f62f168e4d1c978e5f384','hex'),iv=c.randomBytes(16),ci=c.createCipheriv('aes-256-cbc',k,iv);let e=ci.update('Visnex123','utf8','hex');e+=ci.final('hex');console.log(e+'.'+iv.toString('hex'))")
TK=$(curl -s -X POST $BASE_URL:$AUTH_PORT/vn-api/login -H "Content-Type: application/json" -d "{\"username\":\"visnex\",\"password\":\"$EP\"}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
assert_not_empty "JWT token obtained" "$TK"

if [ -z "$TK" ]; then
  echo "  SKIP: Cannot continue without token"
  echo ""
  echo "Results: PASS=$PASS FAIL=$FAIL SKIP=remaining"
  exit 1
fi

H="Authorization: Bearer $TK"

# Test 4: Acquisition - Suppliers
echo ""
echo "[4] Acquisition - Suppliers API"
SUP_RES=$(curl -s -X POST $BASE_URL:$ACQ_PORT/vn-api/v2/supplier/all -H "Content-Type: application/json" -H "$H" -H "lng: es" -d '{"page":0,"size":5}')
SUP_OK=$(echo $SUP_RES | grep -o '"correct":true')
assert_not_empty "Supplier list returns correct:true" "$SUP_OK"

# Test 5: Acquisition - Source Products
echo ""
echo "[5] Acquisition - Source Products API"
SP_RES=$(curl -s -X POST $BASE_URL:$ACQ_PORT/vn-api/v2/source-product/all -H "Content-Type: application/json" -H "$H" -H "lng: es" -d '{"page":0,"size":5}')
SP_OK=$(echo $SP_RES | grep -o '"correct":true')
assert_not_empty "Source Product list returns correct:true" "$SP_OK"

# Test 6: Commerce - Products
echo ""
echo "[6] Commerce - Products API"
PRD_RES=$(curl -s -X POST $BASE_URL:$COM_PORT/vn-api/v2/product/all -H "Content-Type: application/json" -H "$H" -H "lng: es" -d '{"page":0,"size":5}')
PRD_OK=$(echo $PRD_RES | grep -o '"correct":true')
assert_not_empty "Product list returns correct:true" "$PRD_OK"

# Test 7: Commerce - Categories
echo ""
echo "[7] Commerce - Categories API"
CAT_RES=$(curl -s -X POST $BASE_URL:$COM_PORT/vn-api/v2/category/all -H "Content-Type: application/json" -H "$H" -H "lng: es" -d '{"page":0,"size":5}')
CAT_OK=$(echo $CAT_RES | grep -o '"correct":true')
assert_not_empty "Category list returns correct:true" "$CAT_OK"

# Test 8: Commerce - Pricing Config
echo ""
echo "[8] Commerce - Pricing Config API"
PC_RES=$(curl -s -X POST $BASE_URL:$COM_PORT/vn-api/v2/pricing-config/all -H "Content-Type: application/json" -H "$H" -H "lng: es" -d '{"page":0,"size":5}')
PC_OK=$(echo $PC_RES | grep -o '"correct":true')
assert_not_empty "PricingConfig returns correct:true" "$PC_OK"

# Test 9: Commerce - Publish Channels
echo ""
echo "[9] Commerce - Publish Channels API"
CH_RES=$(curl -s -X POST $BASE_URL:$COM_PORT/vn-api/v2/publish-channel/all -H "Content-Type: application/json" -H "$H" -H "lng: es" -d '{"page":0,"size":5}')
CH_OK=$(echo $CH_RES | grep -o '"correct":true')
assert_not_empty "PublishChannel returns correct:true" "$CH_OK"

# Test 10: WordPress
echo ""
echo "[10] WordPress Health"
WP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL:$WP_PORT)
assert_eq "WordPress :$WP_PORT responds" "200" "$WP_STATUS"

# Test 11: WooCommerce API
echo ""
echo "[11] WooCommerce API"
WC_RES=$(curl -s -u "ck_6ba33a8e17b5e30b310ef6283e47d2c33299b690:cs_6ffb9521bed3a25b4d61133a4d6127a4d6686d4b" "$BASE_URL:$WP_PORT/wp-json/wc/v3/products?per_page=1")
WC_OK=$(echo $WC_RES | grep -c '"id"')
assert_eq "WooCommerce API returns products" "1" "$([ $WC_OK -ge 1 ] && echo 1 || echo 0)"

# Test 12: File Upload
echo ""
echo "[12] File Import - Upload"
echo "titulo,precio" > /tmp/visnex-test.csv
echo "Test E2E Product,9.99" >> /tmp/visnex-test.csv
UP_RES=$(curl -s -X POST $BASE_URL:$ACQ_PORT/vn-api/v2/file-import/upload -H "$H" -H "lng: es" -F "file=@/tmp/visnex-test.csv")
UP_OK=$(echo $UP_RES | grep -o '"correct":true')
assert_not_empty "File upload returns correct:true" "$UP_OK"
rm -f /tmp/visnex-test.csv

# Test 13: Frontend pages
echo ""
echo "[13] Frontend Routes"
for path in "/dashboard" "/dashboard/products/list" "/dashboard/sources/suppliers" "/dashboard/publish/channels" "/dashboard/products/pricing" "/users/login"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL:$FE_PORT$path")
  assert_eq "Route $path" "200" "$STATUS"
done

# Summary
echo ""
echo "=============================="
echo "RESULTS: $PASS passed, $FAIL failed"
echo "=============================="

if [ $FAIL -gt 0 ]; then
  exit 1
fi
