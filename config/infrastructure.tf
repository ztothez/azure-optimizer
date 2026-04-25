resource "azurerm_resource_group" "main" {
  name     = "marketing-resources"
  location = "West Europe"
}

resource "azurerm_app_service_plan" "main" {
  name                = "ztothez-app-plan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  tags = {
    environment = "production"
    team        = "engineering"
  }

  sku {
    tier     = "Premium"
    size     = "P3v2"
    capacity = 2
  }
}

resource "azurerm_app_service_plan" "sales" {
  name                = "ztothez-appserviceplan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  sku {
    tier     = "Standard"
    size     = "S1"
    capacity = 2
  }
}

resource "azurerm_app_service" "offsite" {
  name                = "ztothez-app-service"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  app_service_plan_id = azurerm_app_service_plan.main.id
  https_only          = true
  client_cert_enabled = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    dotnet_framework_version = "v8.0"
    ftps_state               = "FtpsOnly"
    http2_enabled            = true
    min_tls_version          = "1.2"
    scm_type                 = "None"
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