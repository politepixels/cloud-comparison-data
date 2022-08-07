resource "null_resource" "copy_files" {
  provisioner "local-exec" {
    command = "/usr/bin/scp -o IdentitiesOnly=yes -o StrictHostKeyChecking=no -i \"${abspath(path.module)}/output/${var.cloud_provider}/ssh.pem\" -r root@${var.ip_addr}:/tests/ \"${abspath(path.module)}/output/${var.cloud_provider}/\""
  }

  depends_on = [null_resource.test]
}