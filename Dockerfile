FROM gitpod/workspace-full

RUN apt-get update --fix-missing \
    && apt-get install -y asciidoctor
