node {
    
    if (env.BRANCH_NAME != 'main' && env.BRANCH_NAME != 'develop') {
        echo "Skipping build for branch ${env.BRANCH_NAME}"
        return
    }
    
    stage('Build') {
        checkout scm
        
        nodejs('NodeJS-18') {
            sh 'npm ci'
            sh 'npm run build --if-present'
        }
    }
    
    stage('Test') {
        checkout scm
        
        nodejs('NodeJS-18') {
            sh 'npm ci'
            sh 'npm test -- --coverage --coverageReporters=text --coverageReporters=lcov'
        }
        
        archiveArtifacts artifacts: 'coverage/**/*', fingerprint: true
    }
    
    stage('Quality') {
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
    
    stage('Docker Build & Push') {
        withCredentials([
            string(credentialsId: 'DOCKER_PASSWORD', variable: 'DOCKER_PASS')
        ]) {
            sh '''
                echo $DOCKER_PASS | docker login -u $DOCKER_USERNAME --password-stdin
                docker build -t $DOCKER_USERNAME/ci-cd-pipelines:latest .
                docker push $DOCKER_USERNAME/ci-cd-pipelines:latest
            '''
        }
    }
    
    if (env.BRANCH_NAME == 'main') {
        stage('Security Scan') {
            sh '''
                curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
            '''
            
            sh 'trivy image --severity HIGH,CRITICAL --exit-code 0 --ignorefile .trivyignore $DOCKER_USERNAME/ci-cd-pipelines:latest'
        }
    }
    
    if (env.BRANCH_NAME == 'main') {
        stage('Deploy to Production') {
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
