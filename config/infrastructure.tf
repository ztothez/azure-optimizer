resource "azurerm_resource_group" "main" {
  name     = "marketing-resources"
  location = "West Europe"
}

resource "azurerm_service_plan" "main" {
  name                = "ztothez-app-plan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Windows"
  sku_name            = "P3v2"
  worker_count        = 2

  tags = {
    environment = "production"
    team        = "engineering"
  }
}

resource "azurerm_service_plan" "sales" {
  name                = "ztothez-appserviceplan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Windows"
  sku_name            = "S1"
  worker_count        = 2
}

resource "azurerm_windows_web_app" "offsite" {
  name                       = "ztothez-app-service"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  service_plan_id            = azurerm_service_plan.main.id
  https_only                 = true
  client_certificate_enabled = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    ftps_state          = "FtpsOnly"
    http2_enabled       = true
    minimum_tls_version = "1.2"

    application_stack {
      current_stack  = "dotnet"
      dotnet_version = "v8.0"
    }
  }

  auth_settings {
    enabled = true
  }

  app_settings = {
    "SOME_KEY" = "some-value"
  }

  connection_string {
    name  = "Database"
    type  = "SQLServer"
    value = "Server=some-server.ztothez.com;Integrated Security=SSPI"
  }
}