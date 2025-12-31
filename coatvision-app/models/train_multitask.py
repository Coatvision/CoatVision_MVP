# Intern / Konfidensiell – CoatVision treningsskript (v0.1)
# DATO: 11.11.2025

import os, json, random
from pathlib import Path
from typing import List, Tuple

import numpy as np
from PIL import Image

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset, random_split
import torchvision.transforms as T
import torchvision.models as tv_models  # alias for å unngå navn-kollisjon
