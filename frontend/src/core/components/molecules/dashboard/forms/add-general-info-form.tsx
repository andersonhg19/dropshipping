'use client'

import React, { useState } from 'react'

import AttachFileIcon from '@mui/icons-material/AttachFile'
import { Button, Card, CardContent, Collapse, Stack, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

type AddGeneralInfoFormProps = {
  onSave?: (data: { nombre: string; fecha: string; valor: string; comprobante: File | null }) => void
}

const AddGeneralInfoForm: React.FC<AddGeneralInfoFormProps> = ({ onSave }) => {
  const { t } = useTranslation()
  const [openForm, setOpenForm] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    fecha: '',
    valor: '',
    comprobante: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSave) onSave(form)
    alert(t('msg_record_saved') + '\n' + JSON.stringify(form, null, 2))
    setForm({ nombre: '', fecha: '', valor: '', comprobante: null })
    setOpenForm(false)
  }

  return (
    <>
      <Button
        variant={openForm ? 'outlined' : 'contained'}
        onClick={() => setOpenForm((v) => !v)}
        sx={{ mb: 3, fontWeight: 700, fontSize: 16 }}
      >
        {openForm ? t('lbl_close_form') : t('lbl_add_record')}
      </Button>
      <Collapse in={openForm} sx={{ mb: 4 }}>
        <Card sx={{ maxWidth: 480, mx: 'auto', boxShadow: 3, p: 2 }}>
          <CardContent>
            <form onSubmit={handleSubmit} autoComplete="off">
              <Stack spacing={2}>
                <TextField
                  label={t('lbl_name')}
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  fullWidth
                />
                <TextField
                  label={t('lbl_date')}
                  name="fecha"
                  type="date"
                  value={form.fecha}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label={t('lbl_value')}
                  name="valor"
                  type="number"
                  value={form.valor}
                  onChange={handleChange}
                  required
                  fullWidth
                  inputProps={{ min: 0 }}
                />
                <Button variant="outlined" component="label" startIcon={<AttachFileIcon />}>
                  {t('lbl_attach_receipt')}
                  <input
                    name="comprobante"
                    type="file"
                    hidden
                    onChange={handleChange}
                    accept="image/*,application/pdf"
                  />
                </Button>
                {form.comprobante && (
                  <Typography variant="body2" color="text.secondary">
                    {t('lbl_file')}: {form.comprobante.name}
                  </Typography>
                )}
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, fontWeight: 700 }}>
                  {t('btn_save')}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Collapse>
    </>
  )
}

export default AddGeneralInfoForm
