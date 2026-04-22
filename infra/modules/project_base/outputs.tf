output "enabled_services" {
  description = "Enabled APIs for the current project."
  value       = keys(google_project_service.enabled)
}

