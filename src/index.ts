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

    core.info(
        JSON.stringify(
            {
                ...ownership,
                name: 'Cypress Check',
                head_sha: context.sha,
                details_url: 'https://www.soomolearning.com/',
                conclusion: 'neutral',
                status: 'completed',
            },
            null,
            2
        )
    )

    const { data } = await octokit.checks.create({
        ...ownership,
        name: 'Cypress Check',
        head_sha: context.sha,
        details_url: 'https://www.soomolearning.com/',
        conclusion: 'action_required',
    })

    core.info(String(data.details_url))

    core.info(JSON.stringify(data, null, 2))
}

run()
