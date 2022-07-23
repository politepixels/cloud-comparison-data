terraform {
  required_version = ">= 0.13.0"
  backend "gcs" {
    bucket = "cloud-comparison-tf-states"
    prefix = "hetzner"
    credentials = "../../keys/production.json"
  }
}