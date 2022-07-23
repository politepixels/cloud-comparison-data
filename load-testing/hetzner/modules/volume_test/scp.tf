resource "null_resource" "copy_files" {
  depends_on = [
    null_resource.test
  ]

  connection {
    type        = "ssh"
    host        = hcloud_server.main.ipv4_address
    private_key = tls_private_key.key.private_key_pem
  }

  provisioner "local-exec" {
    command = "/usr/bin/scp -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -i \"${abspath(path.module)}/output/ssh.pem\" -r root@${hcloud_server.main.ipv4_address}:/tests/ \"${abspath(path.module)}/output/\""
  }
}