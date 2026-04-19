import torch
import torch.nn as nn
import torch.nn.functional as F


class FocalLoss(nn.Module):
    def __init__(self, alpha=None, gamma=2.0):
        super(FocalLoss, self).__init__()
        self.alpha = alpha
        self.gamma = gamma

    def forward(self, inputs, targets):

        # Cross entropy (no reduction)
        ce_loss = F.cross_entropy(inputs, targets, reduction='none')

        # Get probabilities
        pt = torch.exp(-ce_loss)

        # Apply focal loss formula
        focal_loss = (1 - pt) ** self.gamma * ce_loss

        # Apply class weights if given
        if self.alpha is not None:
            alpha_t = self.alpha[targets]
            focal_loss = alpha_t * focal_loss

        return focal_loss.mean()