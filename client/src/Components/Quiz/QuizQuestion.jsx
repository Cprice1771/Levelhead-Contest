import React, { Component } from 'react';
import * as moment from 'moment';
import { NavButton } from '../Forms/Button';
import styled from 'styled-components'
import { Title } from '../Forms/Text'
import { ColumnContainer } from '../Forms/Containers'

const AnswerButton = styled(NavButton)`
    width: 400px;
`

export default class QuizQuestion extends Component {
    constructor(props){
        super(props);

        this.state = {
            quizStared: false,
            quizQuestion: 0,
        }
    }

    render() {
        return <>
            <Title>{this.props.question}</Title>
            <ColumnContainer>
            {
                this.props.answers.map(x => {
                    return <AnswerButton key={x.AnswerText} className='btn-primary' onClick={() => this.props.selectedAnswer(x)}>{x.AnswerText}</AnswerButton>
                })
            }
            </ColumnContainer>
            
        </>
    }
}