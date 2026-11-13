'use client';
import { useEffect } from 'react';
import { initMotion } from '../lib/motion';

export default function MotionEffects() {
  useEffect(() => initMotion(), []);
  return null;
}
