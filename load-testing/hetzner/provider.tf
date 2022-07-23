provider "hcloud" {
  token         = var.hetzner_api_key
  poll_interval = "2500ms"
}