pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = "1"
    }

    stages {

        // 🔹 1. Clone Repository
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/Rahul-Kali/application-project.git'
            }
        }

        // 🔹 2. Build Spring Boot Services
        stage('Build Spring Boot Services') {
            steps {
                sh '''
                cd user-service && mvn clean package -DskipTests
                cd ../product-service && mvn clean package -DskipTests
                cd ../order-service && mvn clean package -DskipTests
                '''
            }
        }

        // 🔹 3. Docker Compose Test
        stage('Docker Compose Test') {
            steps {
                sh '''
                docker-compose down || true
                docker-compose up -d --build
                sleep 20
                docker-compose ps
                docker-compose down
                '''
            }
        }

        // 🔥 4. Start Minikube
        stage('Setup Minikube Cluster') {
            steps {
                sh '''
                echo "🔧 Starting Minikube..."

                # Stop old cluster if running
                minikube stop || true

                # Start Minikube
                minikube start --driver=docker

                echo "📌 Verifying cluster..."
                kubectl cluster-info
                kubectl get nodes
                '''
            }
        }

        // 🔥 5. Use Minikube Docker Environment
        stage('Configure Docker for Minikube') {
            steps {
                sh '''
                echo "🐳 Configuring Docker environment for Minikube..."

                eval $(minikube docker-env)

                docker info
                '''
            }
        }

        // 🔥 6. Build Docker Images INSIDE Minikube
        stage('Build Docker Images') {
            steps {
                sh '''
                echo "🚀 Building Docker images inside Minikube..."

                eval $(minikube docker-env)

                docker build -t user-service:latest ./user-service
                docker build -t product-service:latest ./product-service
                docker build -t order-service:latest ./order-service

                docker build -t payment-service:latest ./payment-service
                docker build -t notification-service:latest ./notification-service
                docker build -t analytics-service:latest ./analytics-service

                docker build -t frontend:latest ./frontendservice

                docker images
                '''
            }
        }

        // 🔹 7. Deploy to Kubernetes
        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                echo "☸️ Deploying to Kubernetes..."

                kubectl apply -f k8s/

                echo "⏳ Waiting for pods..."
                kubectl wait --for=condition=Ready pods --all --timeout=300s
                '''
            }
        }

        // 🔹 8. Verify Deployment
        stage('Verify Deployment') {
            steps {
                sh '''
                echo "📊 Deployment Status"

                kubectl get pods -o wide
                kubectl get svc
                '''
            }
        }
    }

    post {
        success {
            echo '✅ CI/CD Pipeline Completed Successfully with Minikube!'
        }

        failure {
            echo '❌ Pipeline Failed. Check logs.'
        }

        always {
            sh '''
            echo "🧹 Cleaning up Docker Compose..."
            docker-compose down || true
            '''
        }
    }
}