import { Box, Flex, Typography, Button } from "@strapi/design-system";
import React, { useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";

const BulkActions = ({ selectedRepos, bulkCreateAction, bulkDeleteAction }) => {
  const reposWithoutProjects = selectedRepos.filter((repo) => !repo.projectId);
  const reposWithProjects = selectedRepos.filter((repo) => repo.projectId);

  const projectsToBeCreated = reposWithoutProjects.length;
  const projectsToBeDeleted = reposWithProjects.length;
  const projectIdsToBeDelete = reposWithProjects.map((repo) => repo.projectId);
  const [dialogVisible, setDialogVisible] = useState();

  return (
    <Box paddingBottom={4}>
      <Flex gap={3}>
        <Typography>{`You have ${projectsToBeCreated} projects to generate and ${projectsToBeDeleted} to deleted`}</Typography>
        {projectsToBeCreated > 0 && (
          <Button
            size="S"
            variant="success-light"
            onClick={() => bulkCreateAction(reposWithoutProjects)}
          >
            {`Create ${projectsToBeCreated} project(s)`}
          </Button>
        )}
        {projectsToBeDeleted > 0 && (
          <Button
            size="S"
            variant="danger-light"
            onClick={() => setDialogVisible(true)}
          >
            {`Delete ${projectsToBeDeleted} project(s)`}
          </Button>
        )}
      </Flex>
      <ConfirmationDialog
        visible={dialogVisible}
        message="Are you sure you want to delete these projects?"
        onClose={() => setDialogVisible(false)}
        onConfirm={() => {
          bulkDeleteAction(projectIdsToBeDelete);
          setDialogVisible(false);
        }}
      />
    </Box>
  );
};

export default BulkActions;
