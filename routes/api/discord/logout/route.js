const { IncomingMessage, ServerResponse } = require("http");
const { URL } = require("url");
const BaseRoute = require("../../../../BaseRoute");
const Util = require("../../../../Util");

class Route extends BaseRoute {
  static path = "/api/discord/logout";
  static methods = ["POST"];

  /**
   * @param {URL} url
   * @param {IncomingMessage} request
   * @param {ServerResponse} response
   * @param {string} token
   */
  static async runValid(url, request, response, token) {
    token = url.searchParams.get("token") || token;

    await Util.database.query("DELETE FROM web_client WHERE token = $1", [
      token,
    ]);

    response.writeHead(200);
    response.end();
  }
}

module.exports = Route;
