variable "project_id" {
  description = "Production project id."
  type        = string
  default     = "ustaca-prod"
}

variable "services" {
  description = "APIs enabled in production."
  type        = list(string)
  default = [
    "run.googleapis.com",
    "firestore.googleapis.com",
    "cloudtasks.googleapis.com",
    "cloudscheduler.googleapis.com",
    "secretmanager.googleapis.com",
    "monitoring.googleapis.com"
  ]
}

