import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUIComponent = () => (
  <SwaggerUI url="/openapi.yaml" />
);

export default SwaggerUIComponent;
