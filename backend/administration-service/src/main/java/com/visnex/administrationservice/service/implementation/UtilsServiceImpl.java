package com.visnex.administrationservice.service.implementation;

import com.visnex.administrationservice.dto.output.ResultDTO;
import com.visnex.administrationservice.enums.Message;
import com.visnex.administrationservice.enums.TypeDocument;
import com.visnex.administrationservice.security.ConnectInternalApi;
import com.visnex.administrationservice.service.UtilsService;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class UtilsServiceImpl implements UtilsService {

    private final ConnectInternalApi connectInternalApi;

    public UtilsServiceImpl(ConnectInternalApi connectInternalApi) {
        this.connectInternalApi = connectInternalApi;
    }

    @Override
    public ResultDTO typeDocument(String language) throws Exception {
        try {
            List<Map<String, String>> responseList = new ArrayList<>();
            for (TypeDocument.List type : TypeDocument.List.values()) {
                Map<String, String> entry = new HashMap<>();
                entry.put("code", type.getCode());
                entry.put("name", type.getName(language));
                entry.put("dianCode", String.valueOf(type.getDianCode()));
                responseList.add(entry);
            }
            return new ResultDTO(responseList);
        } catch (Exception err) {
            return new ResultDTO(
                    false,
                    connectInternalApi.chargeMessage(Message.Msj.return_process_error.toString(), language),
                    103,
                    err.getMessage()
            );
        }
    }

}
