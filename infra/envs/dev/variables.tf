variable "project_id" {
  description = "Development project id."
  type        = string
  default     = "ustaca-dev"
}

variable "services" {
  description = "APIs enabled in development."
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

