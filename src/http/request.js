import { request } from "graphql-request";

export const fetchData = async (data) => {
  const endpoint =
    "https://api.studio.thegraph.com/query/84515/stakingreward/version/latest";
  return request(endpoint, data);
};
