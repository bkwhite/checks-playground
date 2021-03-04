import * as core from '@actions/core'
import * as github from '@actions/github'

async function run() {
    const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    const { context } = github

    const { repository } = context.payload

    const ownership = {
        owner: context.repo.owner,
        repo: context.repo.repo,
    }

    const { data } = await octokit.checks.create({
        ...ownership,
        name: 'Soomo Check',
        head_sha: context.sha,
        details_url: 'https://www.chromatic.com/pullrequest?appId=5e691330fb5ac50022e9a397&number=168',
        started_at: new Date().toISOString(),
        conclusion: 'action_required',
    })

    core.info(String(data.details_url))

    core.info(JSON.stringify(data, null, 2))
}

run()
