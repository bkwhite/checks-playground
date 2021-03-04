import * as core from '@actions/core'
import * as github from '@actions/github'

async function run() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    const { context } = github

    const { repository } = context.payload

    await octokit.checks.create({
        owner: repository?.owner.login,
        repo: repository?.full_name,
        name: 'Cypress Check',
        head_sha: context.sha,
        details_url: "https://www.soomolearning.com/",
        conclusion: 'neutral'
    })
}

run()
