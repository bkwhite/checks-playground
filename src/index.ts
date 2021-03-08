import fs from 'fs'
import path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'

import { formatSummaryData, buildSummaryData } from './summary'
import { MochawesomeOutput } from './types'

function buildSummary(outputFilePath: string) {
    const outputJson = fs.readFileSync(path.join(outputFilePath), 'utf-8')

    return formatSummaryData(
        buildSummaryData(JSON.parse(outputJson) as MochawesomeOutput)
    )
}

async function run() {
    const GITHUB_TOKEN = core.getInput('token', { required: true })
    const CYPRESS_OUTPUT = core.getInput('cypress_output', { required: true })
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

    core.info(`Summary`)
    core.info(buildSummary(CYPRESS_OUTPUT))

    const { data } = await octokit.checks.create({
        ...ownership,
        name: 'Soomo Check',
        head_sha: context.sha,
        details_url: 'https://soomolearning.com',
        // started_at: new Date().toISOString(),
        conclusion: 'success',
        output: {
            title: 'Check Output',
            summary: buildSummary(CYPRESS_OUTPUT),
        },
    })

    core.info('DONE')

    core.info(JSON.stringify(data, null, 2))
}

run()
