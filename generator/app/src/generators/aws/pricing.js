const { PricingClient, DescribeServicesCommand } = require("@aws-sdk/client-pricing");

https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/20220304165507/index.json

const client = new PricingClient({ region: "us-east-1" });
const command = new DescribeServicesCommand({});

client.send(command)
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error(error);
  });