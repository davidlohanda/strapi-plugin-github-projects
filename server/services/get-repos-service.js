"use strict";

const { request } = require("@octokit/request");
const axios = require("axios");
const md = require('markdown-it')

module.exports = ({ strapi }) => ({
  getProjectForRepo: async (repo) => {
    const { id } = repo;
    const matchingProjects = await strapi.entityService.findMany(
      "plugin::github-projects.project",
      {
        filters: {
          repositoryId: id,
        },
      }
    );

    if (matchingProjects.length === 1) return matchingProjects[0].id;
    return null;
  },
  getPublicRepos: async () => {
    const result = await request("GET /user/repos", {
      headers: {
        authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      type: "public",
    });

    // id, name, shortDescription, longDescription, url
    //https://raw.githubusercontent.com/davidlohanda/weather-app/master/README.md
    const promiseResults = await Promise.allSettled(
      result.data.map(async (item) => {
        const { id, name, description, html_url, owner, default_branch } = item;
        const readmeUrl = `https://raw.githubusercontent.com/${owner.login}/${name}/${default_branch}/README.md`;
        let repo;
        try {
          const longDescription = (await axios.get(readmeUrl)).data;
          repo = {
            id,
            title: name,
            shortDescription: description,
            url: html_url,
            longDescription,
          };
          const relatedProjectId = await strapi
            .plugin("github-projects")
            .service("getReposService")
            .getProjectForRepo(repo);

          return {
            ...repo,
            projectId: relatedProjectId,
          };
        } catch (err) {
          repo = {
            id,
            title: name,
            shortDescription: description,
            url: html_url,
            longDescription: null,
          };
          const relatedProjectId = await strapi
            .plugin("github-projects")
            .service("getReposService")
            .getProjectForRepo(repo);

          return {
            ...repo,
            projectId: relatedProjectId,
          };
        }
      })
    );

    return promiseResults.map((item) => item.value);
  },
});
