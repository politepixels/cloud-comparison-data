resource "hcloud_volume" "main" {
  name              = module.label.id
  size              = var.size
  location          = var.datacenter
  format            = "ext4"
  delete_protection = false
}