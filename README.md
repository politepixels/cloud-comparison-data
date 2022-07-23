# Cloud-Comparison-Data

This repository contains the data for the cloud-comparison tool hosted at: https://innocent-infra.nl/en/cloud-comparison.

This repository encourages collaboration to help keep pricing information up-to-date.

I have attempted to create scripts to automate the pricing data for some providers, however some manual work is required to patch values.

Files are standard JSON inside the Yaml serialisation standard, just so I can add comments and other bonuses of using the Yaml standard.

### Disclaimer

Information in this repository is not guaranteed to be correct, however, if something is wrong, please help update the information.

### We do not currently record pricing differences due to scale

Sometimes the pricing of services changes depending on volume, and because of this it can be hard to normalise these prices to make a comparison.

In these situations, we will take the most expensive rate, and imply that that is always the cost. This is partly because we expect that most people using this tool are smaller organisations which do not have special arrangement and deals with their hosting provider.

In the future, with some more engineering effort, we might be able to differentiate these costs on higher loads.