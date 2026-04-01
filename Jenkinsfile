pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: '20'))
    timeout(time: 30, unit: 'MINUTES')
    timestamps()
  }

  environment {
    IMAGE_NAME = "observatory-ui"
    REGISTRY = "docker-registry.openaire.eu/eoscobservatory"
    REGISTRY_CRED = 'openaire-docker-registry-eoscobservatory'
    DOCKER_IMAGE = ''
    DOCKER_TAG = ''
    BUILD_CONFIGURATION = 'prod'
    DOCKER_BUILDKIT = '1'
  }
  stages {
    stage('Determine Docker Tag') {
      steps {
        script {
          def PROJECT_VERSION = sh(script: 'awk -F\'"\' \'/"version"/{print $4; exit}\' package.json', returnStdout: true).trim()
          if (env.BRANCH_NAME == 'develop') {
            DOCKER_TAG = 'dev'
            env.BUILD_CONFIGURATION = 'beta'
            echo "Detected develop branch version: ${PROJECT_VERSION}"
          } else if (env.BRANCH_NAME == 'master') {
            DOCKER_TAG = PROJECT_VERSION
            echo "Detected master branch version: ${PROJECT_VERSION}"
          } else {
            def branch = env.BRANCH_NAME.replace('/', '-')
            DOCKER_TAG = "${PROJECT_VERSION}-${branch}"
            env.BUILD_CONFIGURATION = 'beta'
          }

          currentBuild.displayName = "${currentBuild.displayName}-${DOCKER_TAG}"
        }
      }
    }
    stage('Build Image') {
      steps{
        script {
          DOCKER_IMAGE = docker.build("${REGISTRY}/${IMAGE_NAME}:${DOCKER_TAG}", "--build-arg configuration=${env.BUILD_CONFIGURATION} --label job=${env.JOB_NAME} .")
        }
      }
    }
    stage('Upload Image') {
      when { // upload images only from 'develop' or 'master' branches
        expression {
          return env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'master'
        }
      }
      steps{
        script {
          withCredentials([usernamePassword(credentialsId: "${REGISTRY_CRED}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
              sh """
                  echo "Pushing image: ${DOCKER_IMAGE.id}"
                  echo "$DOCKER_PASS" | docker login ${REGISTRY} -u "$DOCKER_USER" --password-stdin
              """
              DOCKER_IMAGE.push()
              if (env.BRANCH_NAME == 'master') {
                def minorTag = DOCKER_TAG.tokenize('.').take(2).join('.')
                DOCKER_IMAGE.push(minorTag)
              }
          }
        }
      }
    }
    stage('Remove Image') {
      when { expression { return DOCKER_IMAGE != '' } }
      steps{
        script {
          sh "docker rmi ${DOCKER_IMAGE.id}"
          sh "docker image prune -f --filter label=job=${env.JOB_NAME}"
        }
      }
    }

    stage('Handle Releases') {
      when {
        allOf {
          branch 'master'
          not { changeRequest() }  // skip PR builds
        }
      }
      steps {
        lock(resource: "release-${IMAGE_NAME}") {
          withCredentials([string(credentialsId: 'jenkins-github-pat', variable: 'GH_TOKEN')]) {
            sh '''
              [ -f /etc/profile.d/load_nvm.sh ] || { echo "ERROR: /etc/profile.d/load_nvm.sh not found. NVM is required on this agent."; exit 1; }
              . /etc/profile.d/load_nvm.sh
              nvm install --lts
              npx release-please@17 github-release --repo-url ${GIT_URL} --token ${GH_TOKEN}

              npx release-please@17 release-pr --repo-url ${GIT_URL} --token ${GH_TOKEN}
            '''
          }
        }
      }
    }

  }
  post {
    failure {
      emailext(
        subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: """<p>Build <b>${env.JOB_NAME} #${env.BUILD_NUMBER}</b> failed.</p>
                 <p>Branch: <b>${env.BRANCH_NAME}</b></p>
                 <p>Check the details: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>""",
        mimeType: 'text/html',
        recipientProviders: [[$class: 'DevelopersRecipientProvider']],
        to: '$DEFAULT_RECIPIENTS'
      )
    }
    fixed {
      emailext(
        subject: "FIXED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
        body: """<p>Build <b>${env.JOB_NAME} #${env.BUILD_NUMBER}</b> is back to normal.</p>
                 <p>Branch: <b>${env.BRANCH_NAME}</b></p>
                 <p>Check the details: <a href="${env.BUILD_URL}">${env.BUILD_URL}</a></p>""",
        mimeType: 'text/html',
        recipientProviders: [[$class: 'DevelopersRecipientProvider']],
        to: '$DEFAULT_RECIPIENTS'
      )
    }
  }
}
