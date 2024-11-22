// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { createAuthLink, AUTH_TYPE } from "aws-appsync-auth-link";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { fetchAuthSession } from "aws-amplify/auth";
import config  from "../appconfig";

/**
 * Constructs a GraphQL client configured for AWS IAM.
 * @param {string} url 
 */
const createClient = async (url) => {
  const region = config.region;

  if (!region) {
    throw new Error("Region must be set!");
  }

  const auth = {
    type: AUTH_TYPE.AWS_IAM,
    credentials: async () => (await fetchAuthSession()).credentials
  };
  
  const httpLink = new HttpLink({ uri: url });

  const link = ApolloLink.from([
    createAuthLink({ url, region, auth }),
    createSubscriptionHandshakeLink({ url, region, auth }, httpLink)
  ]);
  
  return new ApolloClient({
    link,
    cache: new InMemoryCache()
  });
  
}

export {
  createClient
}