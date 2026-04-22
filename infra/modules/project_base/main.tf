terraform {
  required_version = ">= 1.8.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

resource "google_project_service" "enabled" {
  for_each = toset(var.services)
  project  = var.project_id
  service  = each.value
}

