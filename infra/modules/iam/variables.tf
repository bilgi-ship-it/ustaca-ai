variable "project_id" {
  description = "Google Cloud project id."
  type        = string
}

variable "service_accounts" {
  description = "Service accounts to create."
  type = list(object({
    account_id   = string
    display_name = string
  }))
}

