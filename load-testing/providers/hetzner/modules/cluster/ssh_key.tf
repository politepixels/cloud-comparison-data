resource "tls_private_key" "key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "hcloud_ssh_key" "key" {
  name       = module.label.id
  public_key = tls_private_key.key.public_key_openssh
}