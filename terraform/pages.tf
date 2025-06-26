# Basic project
resource "cloudflare_pages_project" "frontend_project" {
  account_id        = var.cloudflare_account_id
  name              = "transposer"
  production_branch = "main"
  
  build_config = {
    build_command       = "./build.sh"
    destination_dir     = "dist"
    root_dir            = "/"
  }

  source = {
    type = "github"
    config = {
      owner                         = "glynnbird"
      repo_name                     = "transposer"
      production_branch             = "main"
    }
  }
    deployment_configs = {
      preview = {
        environment_variables = {
          NODE_VERSION = "22"
          API_KEY = random_string.apiKey.id
        }

        kv_namespaces = {
          KV = {
            namespace_id = cloudflare_workers_kv_namespace.transposerkv.id
          }
        }
      }
      production = {
        environment_variables = {
          NODE_VERSION = "22"
          API_KEY = random_string.apiKey.id
        }

        kv_namespaces = {
          KV = {
            namespace_id = cloudflare_workers_kv_namespace.transposerkv.id
          }
        }
      }
  }
}

resource "cloudflare_pages_domain" "frontend_domain" {
  account_id   = var.cloudflare_account_id
  project_name = cloudflare_pages_project.frontend_project.name
  name       = var.cloudflare_domain
}

resource "cloudflare_dns_record" "frontend_dns" {
  zone_id = var.cloudflare_zone_id
  name    = "transposer"
  content   = cloudflare_pages_project.frontend_project.subdomain
  type    = "CNAME"
  ttl     = 3600
}
