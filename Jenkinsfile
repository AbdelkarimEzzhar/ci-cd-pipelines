pipeline {
    agent any
    
    environment {
        DOCKER_USERNAME = credentials('DOCKER_USERNAME')
        DOCKER_PASSWORD = credentials('DOCKER_PASSWORD')
        SONAR_TOKEN = credentials('SONAR_TOKEN')
    }
    
    stages {
        stage('Build') {
            steps {
                checkout scm
                
                nodejs('NodeJS-18') {
                    sh 'npm ci'
                    sh 'npm run build --if-present'
                }
            }
        }
        
        stage('Test') {
            steps {
                checkout scm
                
                nodejs('NodeJS-18') {
                    sh 'npm ci'
                    sh 'npm test -- --coverage --coverageReporters=text --coverageReporters=lcov'
                }
                
                archiveArtifacts artifacts: 'coverage/**/*', fingerprint: true
            }
        }
        
        stage('Quality') {
            steps {
                checkout scm
                
                withSonarQubeEnv('SonarCloud') {
                    sh '''
                        sonar-scanner \
                          -Dsonar.projectKey=AbdelkarimEzzhar_ci-cd-pipelines \
                          -Dsonar.organization=abdelkarimezzhar \
                          -Dsonar.sources=src \
                          -Dsonar.tests=tests \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    '''
                }
            }
        }
        
        stage('Docker Build & Push') {
            steps {
                sh '''
                    echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
                    docker build -t $DOCKER_USERNAME/ci-cd-pipelines:latest .
                    docker push $DOCKER_USERNAME/ci-cd-pipelines:latest
                '''
            }
        }
        
        stage('Security Scan') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                sh '''
                    curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
                    trivy image --severity HIGH,CRITICAL --exit-code 0 --ignorefile .trivyignore $DOCKER_USERNAME/ci-cd-pipelines:latest
                '''
            }
        }
        
        stage('Deploy to Production') {
            when {
                expression { env.BRANCH_NAME == 'main' }
            }
            steps {
                input message: 'Deploy to Production?', ok: 'Deploy'
                
                echo 'Deployment to production environment...'
                echo 'Application available at: https://api.example.com'
                echo '  - Pull the Docker image from Docker Hub'
                echo '  - Run docker run with production configuration'
                echo '  - Update DNS/load balancer'
                echo '  - Run health checks'
            }
        }
    }
}