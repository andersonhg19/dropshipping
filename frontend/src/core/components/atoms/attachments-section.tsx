'use client'

import React from 'react'

import {
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

import AddIcon from '@mui/icons-material/Add'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import { useGoogleDrivePicker } from '@hooks/use-google-drive-picker'

interface AttachmentsSectionProps {
  /** Pipe-separated URLs string (e.g. "url1|url2") */
  attachments: string | null
  /** Called with the new pipe-separated string when attachments change */
  onChange: (attachments: string | null) => void
  /** Disable editing (view-only mode) */
  disabled?: boolean
}

/** Parse pipe-separated attachments string into array of URLs */
const parseAttachments = (attachments: string | null): string[] =>
  (attachments ?? '').split('|').filter((u) => u.trim())

/** Extract a short display name from a Google Drive URL */
const getDisplayName = (url: string, index: number): string => {
  const match = url.match(/\/d\/([^/]+)/)
  if (match) return `Comprobante ${index + 1}`
  return `Comprobante ${index + 1}`
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  attachments,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation()
  const { uploadAndGetUrl, loading, error, ready } = useGoogleDrivePicker()

  const urls = parseAttachments(attachments)

  const handleAdd = async () => {
    const newUrl = await uploadAndGetUrl()
    if (newUrl) {
      const current = parseAttachments(attachments)
      current.push(newUrl)
      onChange(current.join('|'))
    }
  }

  const handleRemove = (indexToRemove: number) => {
    const current = parseAttachments(attachments)
    current.splice(indexToRemove, 1)
    onChange(current.length > 0 ? current.join('|') : null)
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <AttachFileIcon fontSize="small" color="action" />
        <Typography variant="subtitle2" fontWeight={600}>
          {t('lbl_attachments')}
        </Typography>
        {!disabled && (
          <Tooltip title={ready ? t('lbl_add_attachment') : (error ?? 'Google Drive not configured')}>
            <span>
              <IconButton
                size="small"
                onClick={handleAdd}
                disabled={loading || !ready}
                color="primary"
              >
                {loading ? <CircularProgress size={18} /> : <AddIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Stack>

      {urls.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5 }}>
          {t('lbl_no_attachments')}
        </Typography>
      ) : (
        <Stack spacing={0.5} sx={{ ml: 3.5 }}>
          {urls.map((url, index) => (
            <Stack key={index} direction="row" alignItems="center" spacing={1}>
              <Chip
                icon={<OpenInNewIcon fontSize="small" />}
                label={
                  <Link
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    color="inherit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {getDisplayName(url, index)}
                  </Link>
                }
                variant="outlined"
                size="small"
                sx={{ maxWidth: 300 }}
              />
              {!disabled && (
                <Tooltip title={t('lbl_remove_attachment')}>
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(index)}
                    color="error"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          ))}
        </Stack>
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ ml: 3.5, mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  )
}

export default AttachmentsSection
