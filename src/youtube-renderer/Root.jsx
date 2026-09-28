import React from 'react';
import { Composition } from 'remotion';
import { StickmanComposition } from './VideoComposition.jsx';

const emptyPlan={fps:30,width:1920,height:1080,durationInFrames:30,audioFile:'',images:[]};
export const RemotionRoot=()=> <Composition id="StickmanVideo" component={StickmanComposition} width={1920} height={1080} fps={30} durationInFrames={30} defaultProps={{plan:emptyPlan}} calculateMetadata={({props})=>{const plan=props.plan??emptyPlan;return{fps:Number(plan.fps??30),width:Number(plan.width??1920),height:Number(plan.height??1080),durationInFrames:Math.max(1,Number(plan.durationInFrames??30))};}}/>;
