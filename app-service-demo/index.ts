import * as pulumi from "@pulumi/pulumi";
import * as inputs from "@pulumi/azure/types/input";
import * as outputs from "@pulumi/azure/types/output";
import * as azure from "@pulumi/azure";
import * as docker from "@pulumi/docker";
const config = new pulumi.Config();

const PREFIX = config.require("deploymentName");
const IMAGE = config.require("image");
const PLAN_TIER = config.require("planTier");
const PLAN_SKU = config.require("planSku")
const variables = {
    RG_NAME: `${PREFIX}-rg`,
    APP_PLAN_NAME: `${PREFIX}-plan`,
    APP_PLAN_TIER: PLAN_TIER,
    APP_PLAN_SKU: PLAN_SKU,
    APP_SERVICE_NAME: `${PREFIX}-app`,
    DOCKER_IMAGE: IMAGE
}

// Create an Azure Resource Group
const resourceGroup = new azure.core.ResourceGroup(variables.APP_PLAN_NAME,
    {
        name: variables.RG_NAME
    }
);

// Configure AppServicePlan
const appServicePlan = new azure.appservice.Plan(variables.APP_PLAN_NAME,
    {
        resourceGroupName: resourceGroup.name,
        sku: {
            size: variables.APP_PLAN_SKU,
            tier: variables.APP_PLAN_TIER
        },
        kind: azure.appservice.Kinds.Linux,
        reserved: true,
        name: variables.APP_PLAN_NAME
    }
);

// Create an App Service
const appService = new azure.appservice.AppService(variables.APP_SERVICE_NAME,
    {
        name: variables.APP_SERVICE_NAME,
        resourceGroupName: resourceGroup.name,
        location: resourceGroup.location,
        appServicePlanId: appServicePlan.id,
        httpsOnly: true,
        siteConfig: {
            alwaysOn: true,
            linuxFxVersion: `DOCKER|${variables.DOCKER_IMAGE}`,
        },
    }
);