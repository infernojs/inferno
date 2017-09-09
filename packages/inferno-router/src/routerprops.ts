/**
 * @module Inferno-Router
 */ /** TypeDoc Comment */

import Component from "inferno-component";

export interface IRouterProps {
  history?: any;
  children?: any;
  router: any;
  location: any;
  baseUrl?: any;
  component?: Component<any, any>;
  asyncBefore?: any;
  onUpdate?: any;
}
