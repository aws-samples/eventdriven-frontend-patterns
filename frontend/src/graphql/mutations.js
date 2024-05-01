import { gql } from "@apollo/client";

export const sendMessage = gql `
  mutation SendMessage ($text: String!) {
    sendMessage(text: $text) {
      id
      __typename
    }
  }
`;