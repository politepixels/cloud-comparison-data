terraform {
  required_providers {
    hcloud = {
      source = "hetznercloud/hcloud"
      version = "1.33.2"
    }

    time = {
      source = "hashicorp/time"
      version = "0.7.2"
    }
  }
}