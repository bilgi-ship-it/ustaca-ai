output "service_account_emails" {
  description = "Provisioned service account emails."
  value       = { for key, account in google_service_account.service_accounts : key => account.email }
}

