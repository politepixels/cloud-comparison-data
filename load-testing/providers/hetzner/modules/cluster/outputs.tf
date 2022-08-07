output "ssh_key" {
  value = tls_private_key.key.private_key_pem
}

output "ip_addr" {
  value = hcloud_server.main.ipv4_address
}