import fs from 'fs'
import path from 'path'
import * as core from '@actions/core'
import * as github from '@actions/github'

import { formatSummaryData, buildSummaryData } from './summary'
import { MochawesomeOutput } from './types'
import { uploadFolder } from './utils/uploadToS3'
import { cucumberToAnnotations } from './utils/cucumberToAnnotation'

function buildSummary(
    outputFilePath: string,
    videoUrls: string[],
    screenshotUrls: string[]
) {
    const outputJson = fs.readFileSync(path.join(outputFilePath), 'utf-8')

    return buildSummaryData(
        JSON.parse(outputJson) as MochawesomeOutput,
        videoUrls,
        screenshotUrls
    )
}

async function run() {
    const GITHUB_TOKEN = core.getInput('token', { required: true })
    const CYPRESS_FOLDER = core.getInput('cypress_folder', { required: true })
    const BUCKET_NAME = core.getInput('BUCKET_NAME')
    const BRANCH_NAME = core.getInput('BRANCH_NAME')
    const AWS_ACCESS_ID = core.getInput('AWS_ACCESS_ID')
    const AWS_SECRET_KEY = core.getInput('AWS_SECRET_KEY')
    const octokit = github.getOctokit(GITHUB_TOKEN)

    const { context } = github
    const ownership = {
        owner: context.repo.owner,
        repo: context.repo.repo,
    }

    const videoUrls = await uploadFolder({
        LOCAL_FOLDER: `${CYPRESS_FOLDER}/videos`,
        FOLDER_IN_BUCKET: `${BRANCH_NAME}/videos`,
        BUCKET_NAME,
        AWS_ACCESS_ID,
        AWS_SECRET_KEY,
    })

    const screenshotUrls = await uploadFolder({
        LOCAL_FOLDER: `${CYPRESS_FOLDER}/screenshots`,
        FOLDER_IN_BUCKET: `${BRANCH_NAME}/screenshots`,
        BUCKET_NAME,
        AWS_ACCESS_ID,
        AWS_SECRET_KEY,
    })

    const summary = buildSummary(
        `${CYPRESS_FOLDER}/reports/output.json`,
        videoUrls,
        screenshotUrls
    )

    const conclusion = summary.reduce((result, current) => {
        if (!current.pass) {
            result = false
        }
        return result
    }, true)

    core.info('CONCLUSION: ' + conclusion)

    const annotations = cucumberToAnnotations(`${CYPRESS_FOLDER}/cucumber-json`)

    core.info(JSON.stringify(annotations, null, 2))

    const { data: checkSuites } = await octokit.checks.listSuitesForRef({
        ...ownership,
        ref: BRANCH_NAME,
    })

    core.info(`Check Suite Count: ${checkSuites.total_count}`)
    checkSuites.check_suites.forEach(cs => {
        core.info(`Check Suite ID: ${cs.id}`)
    })

    const { data } = await octokit.checks.create({
        ...ownership,
        name: 'Soomo Check',
        head_sha: context.sha,
        details_url: 'https://soomolearning.com',
        conclusion: conclusion ? 'success' : 'failure',
        output: {
            title: 'Check Output',
            summary: formatSummaryData(summary),
            annotations,
        },
    })

    core.info('DONE')

    core.info(JSON.stringify(data, null, 2))
}

run()
