resource "cloudflare_workers_kv_namespace" "transposerkv" {
  account_id = var.cloudflare_account_id
  title      = "transposerkv-${terraform.workspace}"
}

output "kv_id" {
  value = cloudflare_workers_kv_namespace.transposerkv.id
}
