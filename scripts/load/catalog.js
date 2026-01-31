import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"],
  },
};

const baseUrl = __ENV.BASE_URL ?? "http://localhost:3000";

export default function () {
  const response = http.get(`${baseUrl}/catalog`);
  check(response, {
    "catalog status 200": (res) => res.status === 200,
  });
  sleep(1);
}
