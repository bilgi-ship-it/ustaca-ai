variable "project_id" {
  description = "Staging project id."
  type        = string
  default     = "ustaca-staging"
}

variable "services" {
  description = "APIs enabled in staging."
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

