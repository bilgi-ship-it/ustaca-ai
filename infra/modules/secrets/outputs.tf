output "secret_name" {
  description = "Provisioned secret resource name."
  value       = google_secret_manager_secret.secret.name
}

