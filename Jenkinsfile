// ---------------------------------------------------------------------------
// BDDPlayWright - CI/CD pipeline (Jenkins, declarative)
//
// SCHEDULE
//   Runs automatically every 3 hours via cron('H H/3 * * *').
//
//   "H" is deliberate: Jenkins hashes the value rather than pinning it to :00,
//   so this job does not collide with every other job firing on the hour.
//   "H/3" in the hour field means every third hour.
//
//   IMPORTANT: a cron in a Jenkinsfile is ignored until the job has indexed the
//   branch at least once. Enable "Scan Multibranch Pipeline Triggers" (or set a
//   poll) or the schedule will never fire.
//
// Also runs on push / pull request via webhook or branch indexing, and on
// manual "Build with Parameters".
//
// WHAT IT DOES
//   1. Checkout
//   2. npm ci, then install the Playwright browser (cached)
//   3. Run the suite with retries enabled
//   4. Run the retry analyser (separates flaky from genuinely failing)
//   5. Generate the Allure report and publish it
//   6. Archive reports, traces, videos and failure screenshots
//
// NOTE ON REPORTS
//   This stack is Node/TypeScript with playwright-bdd, so the extended report is
//   Allure. Extent Reports is a Java/Cucumber-JVM library and has no meaning
//   here - there is no JVM in this build to attach it to.
// ---------------------------------------------------------------------------

pipeline {

    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '20', daysToKeepStr: '7'))
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
        ansiColor('xterm')
    }

    triggers {
        // Every 3 hours, at a Jenkins-chosen minute so jobs do not collide.
        cron('H H/3 * * *')

        // Pick up Jenkinsfile / config changes promptly.
        pollSCM('H/5 * * * *')
    }

    parameters {
        choice(name: 'TAGS',
               choices: ['', '@smoke', '@regression', '@ui', '@api', '@positive', '@negative'],
               description: 'Optional Cucumber tag expression. Empty runs everything.')

        string(name: 'RETRIES',
               defaultValue: '1',
               description: 'Playwright retries per failed test (0 disables retries).')

        string(name: 'WORKERS',
               defaultValue: '2',
               description: 'Parallel workers.')

        string(name: 'BASE_URL',
               defaultValue: 'https://the-internet.herokuapp.com',
               description: 'UI base URL under test.')

        string(name: 'API_BASE_URL',
               defaultValue: 'https://jsonplaceholder.typicode.com',
               description: 'API base URL under test.')

        booleanParam(name: 'FAIL_ON_FLAKY',
                     defaultValue: false,
                     description: 'Fail the build if any scenario passes only after a retry.')

        booleanParam(name: 'HEADLESS',
                     defaultValue: true,
                     description: 'Run browsers headless.')
    }

    environment {
        // Jenkins tools configured in Manage Jenkins -> Tools.
        NODE_HOME = tool 'nodejs-20'
        PATH      = "${NODE_HOME}/bin:${env.PATH}"

        // Playwright keeps its browsers here so they survive between builds.
        PLAYWRIGHT_BROWSERS_PATH = "${env.HOME}/.cache/ms-playwright"

        // Playwright must not try to open a UI on the build agent.
        CI       = 'true'
        HEADLESS = "${params.HEADLESS ? 'true' : 'false'}"

        BASE_URL     = "${params.BASE_URL}"
        API_BASE_URL = "${params.API_BASE_URL}"
        RETRIES      = "${params.RETRIES}"
        WORKERS      = "${params.WORKERS}"

        // Retry analyser settings.
        ANALYSE_RETRIES = 'true'
        FAIL_ON_FLAKY   = "${params.FAIL_ON_FLAKY ? 'true' : 'false'}"
        RETRY_OUTPUT_DIR = 'test-results/retry'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '--- Checking out the repository ---'
                checkout scm
                sh 'node --version && npm --version'
            }
        }

        stage('Install dependencies') {
            steps {
                echo '--- npm ci ---'
                sh 'npm ci'
            }
        }

        stage('Install Playwright browser') {
            steps {
                echo '--- Ensuring Chromium is present (cached between builds) ---'
                // --with-deps installs the OS libraries Chromium needs. Skipped
                // when the cache is warm, which is the normal case.
                sh '''
                    if [ ! -d "$PLAYWRIGHT_BROWSERS_PATH" ]; then
                        npx playwright install --with-deps chromium
                    else
                        echo "Playwright browser cache found - skipping download"
                    fi
                '''
            }
        }

        stage('Typecheck') {
            steps {
                echo '--- TypeScript typecheck ---'
                sh 'npm run typecheck'
            }
        }

        stage('Run tests') {
            steps {
                echo '--- Running the BDD suite (retries enabled) ---'
                script {
                    def tagArg = params.TAGS?.trim()
                    def cmd = 'npm run test:ci'

                    if (tagArg) {
                        echo "Applying tag filter: ${tagArg}"
                        // Pass through Playwright's grep for the tag expression.
                        cmd = "npm run bddgen && npx playwright test --grep \"${tagArg}\" && npm run retry:analyse"
                    } else {
                        echo 'No tag filter - running the full suite'
                    }

                    currentBuild.description = "retries=${params.RETRIES} tags=${tagArg ?: 'all'}"

                    // returnStatus: a failing test must not abort the pipeline
                    // here, or the reports below would never be published.
                    def status = sh(script: cmd, returnStatus: true)
                    if (status != 0) {
                        unstable("Suite reported failures (exit ${status}) - see the retry analyser output above")
                    }
                }
            }
        }

        stage('Retry analyser summary') {
            steps {
                echo '--- Retry analyser verdict ---'
                sh '''
                    if [ -f test-results/retry/retry-report.txt ]; then
                        cat test-results/retry/retry-report.txt
                    else
                        echo "No retry report produced."
                    fi
                '''
            }
        }

        stage('Generate Allure report') {
            steps {
                echo '--- Building the Allure report ---'
                sh 'npx allure generate allure-results --clean -o allure-report'
            }
        }

        stage('Publish reports') {
            steps {
                echo '--- Publishing reports ---'

                // Allure: the extended report. Needs the "Allure Jenkins Plugin".
                allure([
                    includeProperties: false,
                    jdk              : '',
                    properties       : [],
                    reportBuildPolicy: 'ALWAYS',
                    results          : [[path: 'allure-results']],
                ])

                // Playwright's own HTML report, served straight off the agent.
                publishHTML(target: [
                    allowMissing         : true,
                    alwaysLinkToLastBuild: true,
                    keepAll              : true,
                    reportDir            : 'playwright-report',
                    reportFiles          : 'index.html',
                    reportName           : 'Playwright HTML Report',
                ])
            }
        }
    }

    post {
        always {
            echo '--- Archiving artefacts ---'

            // Retry analyser output.
            archiveArtifacts artifacts: 'test-results/retry/**',
                             allowEmptyArchive: true,
                             fingerprint: true

            // Raw Playwright JSON/XML, used by the analyser and by CI dashboards.
            archiveArtifacts artifacts: 'test-results/*.json, test-results/*.xml',
                             allowEmptyArchive: true,
                             fingerprint: true

            // Failure screenshots, videos and traces.
            archiveArtifacts artifacts: 'test-results/**/*.png, test-results/**/*.webm, test-results/**/*.zip',
                             allowEmptyArchive: true

            // The generated Allure report, so a specific build can be reopened
            // even after the plugin's own history rolls over.
            archiveArtifacts artifacts: 'allure-report/**',
                             allowEmptyArchive: true

            junit testResults: 'test-results/junit.xml',
                  allowEmptyResults: true
        }

        unstable {
            echo 'Build UNSTABLE: scenarios failed. Read the retry analyser section above to tell flaky (passed on retry) from genuinely broken.'
        }

        success {
            echo 'Build SUCCESS: all scenarios passed.'
        }

        failure {
            echo 'Build FAILED: infrastructure, install or typecheck broke before the tests could run.'
        }

        cleanup {
            deleteDir()
        }
    }
}