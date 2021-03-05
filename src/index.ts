import * as core from '@actions/core'
import * as github from '@actions/github'
import { Octokit } from '@octokit/core'

async function run_node() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    const { context } = github

    const { repository } = context.payload

    const ownership = {
        owner: context.repo.owner,
        repo: context.repo.repo,
    }

    core.info(
        `Creating a new Run on ${ownership.owner}/${ownership.repo}@${context.sha}`
    )
    const { data } = await octokit.checks.create({
        ...ownership,
        name: 'Soomo Check',
        head_sha: context.sha,
        details_url: 'https://soomolearning.com',
        started_at: new Date().toISOString(),
        conclusion: 'success',
    })
    core.info(JSON.stringify(data, null, 2))
}

async function run() {
    const { context } = github
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = new Octokit({ auth: GITHUB_TOKEN })

    const ownership = {
        owner: context.repo.owner,
        repo: context.repo.repo,
    }

    await octokit.request(`POST /repos/${ownership.owner}/${ownership.repo}/check-runs`, {
        owner: ownership.owner,
        repo: ownership.repo,
        name: 'Soomo Check',
        head_sha: context.sha,
        details_url: 'https://soomolearning.com',
    })
}

run()
