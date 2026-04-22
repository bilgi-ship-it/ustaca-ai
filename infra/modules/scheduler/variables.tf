variable "project_id" {
  description = "Google Cloud project id."
  type        = string
}

variable "region" {
  description = "Cloud Scheduler region."
  type        = string
}

variable "name" {
  description = "Scheduler job name."
  type        = string
}

variable "schedule" {
  description = "Cron schedule."
  type        = string
}

variable "time_zone" {
  description = "IANA timezone."
  type        = string
}

variable "uri" {
  description = "HTTP target URI."
  type        = string
}

