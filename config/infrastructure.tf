resource "azurerm_app_service_plan" "main" {
  name                = "ztothez-app-plan"
  location            = "West Europe"
  resource_group_name = "ztothez-resource-group"
  tags = {
  environment = "production"
  team        = "engineering"
}

  sku {
    tier = "Premium"
    size = "P3v2"
  }
}

resource "azurerm_resource_group" "main" {
  name     = "marketing-resources"
  location = "West Europe"
}

resource "azurerm_app_service_plan" "sales" {
  name                = "ztothez-appserviceplan"
  location            = azurerm_resource_group.ztothez.location
  resource_group_name = azurerm_resource_group.ztothez.name

  sku {
    tier = "Standard"
    size = "S1"
  }
}

resource "azurerm_app_service" "offsite" {
  name                = "ztothez-app-service"
  location            = azurerm_resource_group.ztothez.location
  resource_group_name = azurerm_resource_group.ztothez.name
  app_service_plan_id = azurerm_app_service_plan.ztothez.id

  site_config {
    dotnet_framework_version = "v4.0"
    scm_type                 = "LocalGit"
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